"""
Adzuna job search scraper.
Uses the free Adzuna REST API (https://developer.adzuna.com/).
Covers India (and other countries) with structured JSON responses.

Setup:
    1. Register free at https://developer.adzuna.com/
    2. Set environment variables:
       ADZUNA_APP_ID=your_app_id
       ADZUNA_APP_KEY=your_app_key
   OR add them to config/settings.json as adzuna_app_id / adzuna_app_key.

Free tier: 250 calls/month.
"""

import os
import re
from typing import List, Optional

import requests

from scrapers.base_scraper import BaseScraper, ScrapeResult
from utils.logger import get_logger

logger = get_logger()


class AdzunaScraper(BaseScraper):
    """
    Scraper for Adzuna job listings via their free public REST API.

    Supports multi-country search via the `countries` config list.
    Default country: 'in' (India).
    """

    BASE_URL = "https://api.adzuna.com/v1/api/jobs"
    RESULTS_PER_PAGE = 50

    def __init__(
        self,
        delay_min: float = 2.0,
        delay_max: float = 4.0,
        use_proxy: bool = False,
        countries: Optional[List[str]] = None,
        app_id: Optional[str] = None,
        app_key: Optional[str] = None,
    ):
        super().__init__(
            platform_name="Adzuna",
            delay_min=delay_min,
            delay_max=delay_max,
            max_retries=3,
            use_proxy=use_proxy,
        )
        self.countries = countries or ["in"]  # Default: India

        # Credentials: prefer explicit params → env vars → empty (graceful skip)
        self.app_id = app_id or os.environ.get("ADZUNA_APP_ID", "")
        self.app_key = app_key or os.environ.get("ADZUNA_APP_KEY", "")

        if not self.app_id or not self.app_key:
            logger.warning(
                "ADZUNA_APP_ID / ADZUNA_APP_KEY not set. "
                "Adzuna scraper will be skipped. "
                "Register free at https://developer.adzuna.com/",
                module="Adzuna",
            )

    @property
    def credentials_available(self) -> bool:
        """Returns True if API credentials are configured."""
        return bool(self.app_id and self.app_key)

    def build_search_url(self, job_title: str, page: int = 1, country: str = "in") -> str:
        """Build Adzuna API search URL for a specific country."""
        encoded_title = requests.utils.quote(job_title)
        return (
            f"{self.BASE_URL}/{country}/search/{page}"
            f"?app_id={self.app_id}&app_key={self.app_key}"
            f"&what={encoded_title}&results_per_page={self.RESULTS_PER_PAGE}"
            f"&content-type=application/json"
        )

    def parse_response(self, html: str, job_title: str) -> List[ScrapeResult]:
        """
        Parse Adzuna JSON API response.

        Expected structure:
        {
            "results": [
                {
                    "id": "...",
                    "title": "Senior React Developer",
                    "company": {"display_name": "Acme Corp"},
                    "location": {"display_name": "Bengaluru, India"},
                    "salary_min": 800000,
                    "salary_max": 1200000,
                    "redirect_url": "https://www.adzuna.in/...",
                    "description": "...",
                    "created": "2026-06-01T12:00:00Z"
                }
            ],
            "count": 120
        }
        """
        import json

        results = []
        try:
            data = json.loads(html)
        except Exception as ex:
            logger.debug(f"Adzuna response is not JSON: {ex}", module="Adzuna")
            return results

        jobs = data.get("results", [])
        if not jobs:
            logger.debug("No results in Adzuna API response", module="Adzuna")
            return results

        for job in jobs:
            try:
                result = self._extract_job(job)
                if result and result.title and result.company:
                    results.append(result)
            except Exception as ex:
                logger.debug(f"Failed to parse Adzuna job: {ex}", module="Adzuna")
                continue

        logger.debug(
            f"Parsed {len(results)} jobs from Adzuna for '{job_title}'",
            module="Adzuna",
        )
        return results

    def _extract_job(self, job: dict) -> Optional[ScrapeResult]:
        """Extract a single ScrapeResult from an Adzuna job dict."""
        try:
            title = job.get("title", "").strip()

            # Company
            company_obj = job.get("company", {})
            company = (
                company_obj.get("display_name", "")
                if isinstance(company_obj, dict)
                else str(company_obj)
            )

            # Location
            location_obj = job.get("location", {})
            location = (
                location_obj.get("display_name", "India")
                if isinstance(location_obj, dict)
                else "India"
            )

            # Salary
            salary_min = job.get("salary_min")
            salary_max = job.get("salary_max")
            salary_range = ""
            if salary_min or salary_max:
                parts = []
                if salary_min:
                    parts.append(f"₹{int(salary_min):,}")
                if salary_max:
                    parts.append(f"₹{int(salary_max):,}")
                if parts:
                    salary_range = " – ".join(parts) + " p.a."

            # URL — Adzuna provides a tracking redirect URL
            job_url = job.get("redirect_url") or job.get("url") or ""

            # Posted date
            posted_date = job.get("created", "")

            # Description snippet
            description = job.get("description", "")
            if description:
                # Strip HTML tags if any
                description = re.sub(r"<[^>]+>", "", description)
                description = re.sub(r"\s+", " ", description).strip()[:200]

            return ScrapeResult(
                title=self._clean_text(title),
                company=self._clean_text(company),
                location=self._clean_text(location) or "India",
                url=job_url,
                posted_date=posted_date,
                salary_range=salary_range,
                description_snippet=description,
            )

        except Exception as ex:
            logger.debug(f"Error extracting Adzuna job: {ex}", module="Adzuna")
            return None

    def _clean_text(self, text: str) -> str:
        """Clean extracted text."""
        if not text:
            return ""
        return re.sub(r"\s+", " ", text).strip()

    def search(self, job_title: str, max_results: int = 50) -> List[ScrapeResult]:
        """
        Search Adzuna across all configured countries.
        Skips gracefully if credentials are not set.
        """
        if not self.credentials_available:
            logger.warning(
                "Skipping Adzuna search — API credentials not configured. "
                "Set ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables.",
                module="Adzuna",
            )
            return []

        all_results: List[ScrapeResult] = []

        for country in self.countries:
            country_results: List[ScrapeResult] = []
            page = 1

            while len(country_results) < max_results:
                url = self.build_search_url(job_title, page, country)
                logger.debug(
                    f"Adzuna API request: country={country} page={page} title='{job_title}'",
                    module="Adzuna",
                )

                html = self.make_request(url)
                if not html:
                    logger.warning(
                        f"No response from Adzuna for '{job_title}' (country={country}, page={page})",
                        module="Adzuna",
                    )
                    break

                page_results = self.parse_response(html, job_title)
                for r in page_results:
                    r.source_platform = "Adzuna"

                country_results.extend(page_results)

                # Stop paginating if we got fewer results than a full page
                if len(page_results) < self.RESULTS_PER_PAGE:
                    break

                self._polite_delay()
                page += 1
                if page > 10:
                    break

            logger.debug(
                f"Adzuna ({country.upper()}): {len(country_results)} results for '{job_title}'",
                module="Adzuna",
            )
            all_results.extend(country_results)

        return all_results[:max_results]

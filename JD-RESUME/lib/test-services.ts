import { 
  parseResumeText, 
  parseJDText, 
  calculateMatchScore, 
  rewriteBullet, 
  analyzeGaps 
} from "./services";
import { resumeTailor } from "./orchestrator";

// Simple test to verify imports work
console.log("All services imported successfully");

// Test that the orchestrator is instantiated
console.log("Orchestrator instantiated:", !!resumeTailor);

// Export for potential use in other tests
export { 
  parseResumeText, 
  parseJDText, 
  calculateMatchScore, 
  rewriteBullet, 
  analyzeGaps,
  resumeTailor
};
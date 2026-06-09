"use client";

interface JDInputProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  isLoading?: boolean;
}

export default function JDInput({ value, onChange, isLoading }: JDInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="jd-input"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Job Description
      </label>
      <textarea
        id="jd-input"
        placeholder="Paste the job description text here..."
        className="flex min-h-[250px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        onChange={onChange}
        disabled={isLoading}
      />
      <p className="text-xs text-muted-foreground">
        {value
          ? `${value.length} characters`
          : "Paste the full job description including requirements and responsibilities"}
      </p>
    </div>
  );
}
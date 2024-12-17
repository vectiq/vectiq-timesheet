interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  projects: Array<{ id: string; name: string }>;
}

export function ProjectSelect({ value, onChange, projects }: ProjectSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
    >
      <option value="">Select Project</option>
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  );
}
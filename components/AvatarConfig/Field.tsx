interface FieldProps {
  label: string;
  children: React.ReactNode;
  tooltip?: string;
}

export const Field = (props: FieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-700 text-sm font-medium">{props.label}</label>
      {props.children}
    </div>
  );
};

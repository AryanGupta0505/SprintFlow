"use client"

export const Select = ({
    options,
    onSelect,
    value
}: {
    value?: string;   // 👈 add this
    onSelect: (value: string) => void;
    options: {
        key: string;   // label
        value: string; // actual value
    }[];
}) => {
    return (
        <select
            value={value}  // 👈 controlled
            onChange={(e) => onSelect(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.key}
                </option>
            ))}
        </select>
    );
};
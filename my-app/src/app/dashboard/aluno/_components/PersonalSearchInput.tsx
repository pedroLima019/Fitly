type PersonalSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function PersonalSearchInput({
  value,
  onChange,
}: PersonalSearchInputProps) {
  return (
    <div className="mb-2">
      <label className="text-xs font-medium">Pesquisar personal: </label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pesquisar por nome, treino ou especialidade"
        className="w-full border border-zinc-300 rounded-md p-2 text-xs focus:outline-none"
      />
    </div>
  );
}

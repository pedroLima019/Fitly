export default function ButtonForm(Porps: { text: string }) {
  return (
    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-1 rounded-xl w-full">
      {Porps.text}
    </button>
  );
}

export default function ButtonForm(Porps: { text: string }) {
  return (
    <button className="bg-white w-full text-black text-sm font-semibold p-1.5 rounded hover:bg-gray-200 ">
      {Porps.text}
    </button>
  );
}

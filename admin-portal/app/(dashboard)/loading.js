import AtomLoader from "../../components/ui/AtomLoader";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <AtomLoader />
    </div>
  );
}

import Spinner from "./Spinner";

export default function CenteredLoader({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}

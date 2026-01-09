import Navbar from "@/components/Navbar";
import TerminalWindow from "@/components/TerminalWindow";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="flex items-center justify-center min-h-screen px-4 pt-20">
        <TerminalWindow />
      </main>
    </div>
  );
}

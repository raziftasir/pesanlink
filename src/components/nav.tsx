import ModeToggle from './mode-toggle';

export default function Nav() {
  return (
    <header className="w-full flex items-center justify-between p-4">
      <div className="font-semibold">PesanLink</div>
      <ModeToggle />
    </header>
  );
}

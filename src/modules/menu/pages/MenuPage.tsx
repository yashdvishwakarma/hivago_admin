import { Button } from '@/components/ui/Button';

export default function MenuPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
        <Button>Add Item</Button>
      </div>
      <div className="text-muted-foreground">Menu management interface goes here.</div>
    </div>
  );
}

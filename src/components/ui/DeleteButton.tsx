'use client';

type DeleteButtonProps = {
  name: string;
}

export function DeleteButton({ name }: DeleteButtonProps) {
  return (
    <button
      type="submit"
      className="text-xs text-red-500 hover:text-red-700 font-medium"
      onClick={(e) => {
        if (!confirm(`¿Eliminar ${name}?`)) e.preventDefault();
      }}
    >
      Eliminar
    </button>
  );
}

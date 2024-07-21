"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ChatProps {
  login: string;
  className?: string; // Añadido para recibir className
}

export default function Chat({ login, className }: ChatProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Espera hasta que el componente esté montado
  useEffect(() => {
    setMounted(true);

    if (theme === "system") {
      // Detecta el tema del sistema
      const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // Ajusta el estado según la preferencia del sistema
      setResolvedTheme(darkModeMediaQuery.matches ? "dark" : "light");

      // Escucha cambios en la preferencia del sistema
      const handleChange = (event: MediaQueryListEvent) => {
        setResolvedTheme(event.matches ? "dark" : "light");
      };

      darkModeMediaQuery.addEventListener("change", handleChange);

      // Limpia el listener al desmontar
      return () => {
        darkModeMediaQuery.removeEventListener("change", handleChange);
      };
    } else {
      // Si el tema no es 'system', usa el tema directamente
      setResolvedTheme(theme === "dark" ? "dark" : "light");
    }
  }, [theme]);

  // Si el componente aún no está montado, no renders
  if (!mounted) return null;

  console.log(resolvedTheme); // Ahora deberías ver el tema correctamente

  return (
    <iframe
      src={`https://www.twitch.tv/embed/${login}/chat?${
        resolvedTheme === "dark" ? "darkpopout" : ""
      }&parent=${window.location.hostname}`}
      width="100%"
      height="100%"
      className={` ${className}`}
    />
  );
}

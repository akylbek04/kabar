import { Link } from "react-router-dom";
import logoDark from "@/assets/kabar_dark.png";
import logoLight from "@/assets/kabar_light.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  url?: string;
  showText?: boolean;
  imgClass?: string;
  textClass?: string;
}

const Logo = ({
  url = "/",
  showText = true,
  imgClass = "size-[30px]",
  textClass,
}: LogoProps) => (
  <Link to={url} className="flex items-center gap-2 w-fit">
    <span
      className={cn("inline-flex shrink-0", imgClass)}
      role="img"
      aria-label="Kabar"
    >
      <img src={logoLight} alt="" className="size-full dark:hidden" />
      <img src={logoDark} alt="" className="hidden size-full dark:block" />
    </span>
    {showText && (
      <span className={cn("font-semibold text-lg leading-tight", textClass)}>
        Kabar
      </span>
    )}
  </Link>
);

export default Logo;

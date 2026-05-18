import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "./theme-provider";
import { isUserOnline } from "@/lib/helper";
import Logo from "./logo";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AvatarWithBadge from "./avatar-with-badge";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/use-notifications";

const AsideBar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const isOnline = isUserOnline(user?._id);
  const totalUnread = useNotifications((s) =>
    Object.values(s.unreadByChat).reduce((sum, n) => sum + n, 0)
  );

  return (
    <aside
      className="
  top-0 fixed inset-y-0
  w-11 left-0 z-[9999]
  h-svh bg-primary/85 shadow-sm"
    >
      <div
        className="
       w-full h-full px-1 pt-1 pb-6 flex flex-col
       items-center justify-between"
      >
        <div className="relative">
          <Logo
            url={PROTECTED_ROUTES.CHAT}
            imgClass="size-8 mt-2"
            textClass="text-white"
            showText={false}
          />
          {totalUnread > 0 && (
            <span
              className="absolute top-1 right-0 min-w-[16px] h-4 px-1
              flex items-center justify-center rounded-full bg-destructive
              text-[9px] font-bold text-white"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </div>

        <div
          className="
         flex flex-col items-center gap-3
        "
        >
          <Button
            variant="outline"
            size="icon"
            className="border-0 rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun
              className="
              h-[1.2rem]
              w-[1.2rem]
              scale-100
              rotate-0
              transition-all dark:scale-0 dark:-rotate-90
            "
            />
            <Moon
              className="
             absolute
              h-[1.2rem]
              w-[1.2rem]
              scale-0
              rotate-90
              transition-all dark:scale-100
              dark:-rotate-0
              "
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div role="button">
                {/* {Avatar} */}
                <AvatarWithBadge
                  name={user?.name || "unKnown"}
                  src={user?.avatar || ""}
                  isOnline={isOnline}
                  className="!bg-white"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 rounded-lg z-[99999]"
              align="end"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(PROTECTED_ROUTES.PROFILE)}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
};

export default AsideBar;

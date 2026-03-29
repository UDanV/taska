import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export const CustomDropdown = () => {
    const { data: session } = useSession();

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <button className="rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar
                        name={session?.user?.name || "Taska"}
                        className="cursor-pointer bg-primary text-primary-foreground font-semibold text-lg"
                    />
                </button>
            </DropdownTrigger>
            <DropdownMenu className="min-w-60 rounded-2xl p-1">
                <DropdownItem
                    key="profile"
                    as={Link}
                    href="/dashboard/profile"
                    className="rounded-xl opacity-100"
                >
                    <div className="flex flex-col gap-0.5 py-1">
                        <span className="text-sm font-semibold">
                            {session?.user?.name || "Пользователь"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {session?.user?.email || "Рабочее пространство Taska"}
                        </span>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key="settings"
                    as={Link}
                    href="/dashboard/settings"
                    className="rounded-xl"
                    startContent={<Settings size={16} />}
                >
                    Настройки
                </DropdownItem>
                <DropdownItem
                    key="logout"
                    color="danger"
                    className="rounded-xl"
                    startContent={<LogOut size={16} />}
                    onPress={() => signOut({ callbackUrl: "/" })}
                >
                    Выйти
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};
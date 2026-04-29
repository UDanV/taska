import type { TeamColor } from "@/app/entities/team/model/types";
import type { TeamManagerItem } from "@/app/entities/team/model/types";

export interface TeamFormState {
    name: string;
    color: TeamColor;
    pmId: string;
};

export interface CreateTeamModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    teamForm: TeamFormState;
    teamManagers: TeamManagerItem[];
    savingTeam: boolean;
    onTeamFormChange: (next: TeamFormState | ((current: TeamFormState) => TeamFormState)) => void;
    onCreateTeam: () => void | Promise<void>;
};
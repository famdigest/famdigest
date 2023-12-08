import { useEffect, useState } from "react";
import { trpc } from "~/lib/trpc";
import type { Table } from "@repo/supabase";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormField,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
  slugify,
} from "@repo/ui";
import {
  IconCheck,
  IconCirclePlus,
  IconLoader,
  IconSelector,
} from "@tabler/icons-react";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { useRevalidator } from "@remix-run/react";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";

const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Handle is required"),
  settings: z.record(z.string()).optional(),
});
type WorkspaceForm = z.infer<typeof workspaceSchema>;

export function WorkspaceSwitcher() {
  const utils = trpc.useUtils();
  const revalidator = useRevalidator();
  const { workspace } = useWorkspaceLoader();
  const { data: workspaces } = trpc.workspaces.all.useQuery();
  const switchMutation = trpc.workspaces.switch.useMutation({
    onSuccess: () => {
      utils.invalidate();
      revalidator.revalidate();
    },
  });

  const [open, setOpen] = useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] =
    useState<Table<"workspaces">>(workspace);

  const form = useForm<WorkspaceForm>({
    initialValues: {
      name: "",
      slug: "",
    },
  });

  useEffect(() => {
    setSelectedTeam(workspace);
  }, [workspace]);

  const createWorkspace = trpc.workspaces.create.useMutation();

  const onSubmit = (values: WorkspaceForm) => {
    createWorkspace.mutate(
      {
        ...values,
      },
      {
        onSuccess: () => {
          setShowNewTeamDialog(false);
          revalidator.revalidate();
        },
      }
    );
  };

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn("w-[250px] justify-between")}
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${selectedTeam.name}.png`}
                alt={selectedTeam.name}
              />
              <AvatarFallback>{selectedTeam.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            {selectedTeam.name}
            <IconSelector className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No workspace found.</CommandEmpty>
              {workspaces?.map((space) => (
                <CommandItem
                  key={space.id}
                  onSelect={() => {
                    setSelectedTeam(space);
                    switchMutation.mutate(space.id);
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${space.name}.png`}
                      alt={space.name}
                      className="grayscale"
                    />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  {space.name}
                  <IconCheck
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedTeam.id === space.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewTeamDialog(true);
                    }}
                  >
                    <IconCirclePlus className="mr-2 h-5 w-5" />
                    Create Team
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Add a new team to manage products and customers.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 pb-4">
          <form
            id="newWorkspaceForm"
            onSubmit={form.onSubmit(onSubmit)}
            className="flex flex-col items-stretch gap-y-4"
          >
            <FormField
              type="text"
              label="Workspace Name"
              placeholder="ACME Company"
              {...form.getInputProps("name")}
              render={(field) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange?.(e);
                    form.setFieldValue("slug", slugify(e.target.value));
                  }}
                />
              )}
            />
            <FormField
              type="text"
              label="Handle"
              {...form.getInputProps("slug")}
              render={(field) => <Input {...field} />}
            />
          </form>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNewTeamDialog(false)}>
            Cancel
          </Button>
          <Button
            form="newWorkspaceForm"
            type="submit"
            disabled={createWorkspace.isLoading}
          >
            {createWorkspace.isLoading && (
              <IconLoader className="animate-spin mr-2" />
            )}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

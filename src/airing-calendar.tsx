import { Action, ActionPanel, Icon, Keyboard, List } from "@raycast/api";
import { useCachedState, usePromise } from "@raycast/utils";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { DetailDrama } from "./components/detail-page";
import { DetailProgress } from "./components/detail-progress";
import { AIRING } from "./lib/data";
import { AiringFilter, DaysOfWeek, Drama } from "./lib/types";
import { capitalize, sleep } from "./lib/utils";

type SetAiringFiltering = (filtering: AiringFilter) => void;
type Revalidate = () => Promise<
  {
    dramas: Drama[];
    day: DaysOfWeek;
    date: string;
  }[]
>;

function ListFilter({ setFiltering }: { setFiltering: SetAiringFiltering }) {
  return (
    <List.Dropdown
      tooltip="Filter Airing Schedule"
      onChange={(value) => setFiltering(value as AiringFilter)}
      storeValue={false}
      throttle>
      <List.Dropdown.Section>
        <List.Dropdown.Item value="all" title="All" />
        <List.Dropdown.Item value="my-list" title="My List" />
      </List.Dropdown.Section>
      <List.Dropdown.Section title="Country">
        <List.Dropdown.Item value="south-korea" title="South Korea" />
        <List.Dropdown.Item value="japan" title="Japan" />
        <List.Dropdown.Item value="china" title="China" />
        <List.Dropdown.Item value="hongkong" title="Hong Kong" />
        <List.Dropdown.Item value="taiwan" title="Taiwan" />
        <List.Dropdown.Item value="thailand" title="Thailand" />
        <List.Dropdown.Item value="philippines" title="Philippines" />
        <List.Dropdown.Item value="singapore" title="Singapore" />
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

function ItemActions({
  data,
  selected,
  revalidate,
}: {
  data: Drama;
  selected?: Drama;
  revalidate: Revalidate;
}) {
  return (
    <ActionPanel>
      <ActionPanel.Section title={selected?.title ?? ""}>
        <Action.Push
          title="See Detail"
          target={<DetailDrama data={data} />}
          icon={Icon.Info}
        />
        <Action.OpenInBrowser title="Open in Browser" url={data.link} />
        <Action.Push
          title="Add to Watchlist"
          target={<DetailProgress data={data} />}
          icon={Icon.PlusCircle}
          shortcut={Keyboard.Shortcut.Common.New}
        />
      </ActionPanel.Section>
      <ActionPanel.Section>
        <Action.CopyToClipboard
          title="Copy Page Link"
          content={data.link}
          shortcut={Keyboard.Shortcut.Common.CopyPath}
        />
        <Action.CopyToClipboard
          title="Copy Title"
          content={data.title}
          shortcut={Keyboard.Shortcut.Common.CopyName}
        />
      </ActionPanel.Section>
      <ActionPanel.Section>
        <Action
          title="Refresh Data"
          icon={Icon.RotateClockwise}
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={revalidate}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

export default function Command() {
  const [filtering, setFiltering] = useState<AiringFilter>("all");
  const [searchText, setSearchText] = useCachedState<string>(
    "airing-calendar",
    "",
  );

  const { isLoading, data, revalidate } = usePromise(
    async (searchText: string, filtering: AiringFilter) => {
      await sleep();

      return AIRING.map((schedule) => ({
        ...schedule,
        dramas: schedule.dramas
          .filter((item) =>
            item.title.toLowerCase().includes(searchText.toLowerCase()),
          )
          .filter((item) =>
            filtering !== "all" && filtering !== "my-list"
              ? item.country === filtering
              : true,
          ),
      })).filter((schedule) => schedule.dramas.length > 0);
    },
    [searchText, filtering],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = useMemo(() => {
    if (!data) return undefined;

    return data
      .flatMap((s) => s.dramas)
      .find((item: Drama) => item.id === selectedId);
  }, [selectedId, data]);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Find dramas airing this week"
      searchBarAccessory={<ListFilter setFiltering={setFiltering} />}
      selectedItemId={selectedId ?? undefined}
      onSelectionChange={(value) => setSelectedId(value ?? "")}
      onSearchTextChange={setSearchText}>
      {data && data.length > 0 ? (
        data.map((schedule) => (
          <List.Section
            key={schedule.day}
            title={capitalize(schedule.day)}
            subtitle={format(new Date(schedule.date), "MMMM d, yyyy")}>
            {schedule.dramas.map((item) => (
              <List.Item
                key={item.id}
                id={item.id}
                icon={item.icon}
                title={item.title}
                subtitle={item.episodes ? `Episodes ${item.episodes}` : capitalize(item.type)}
                accessories={[
                  {
                    icon: Icon.Flag,
                    text: item.country,
                  },
                  { icon: Icon.Clock, text: item.airTime ?? "N/A" },
                ]}
                actions={
                  <ItemActions
                    data={item}
                    selected={selectedItem}
                    revalidate={revalidate}
                  />
                }
              />
            ))}
          </List.Section>
        ))
      ) : (
        <List.EmptyView
          icon={Icon.Tray}
          title="No dramas airing this week"
          description="Try searching for other dramas airing this week..."
        />
      )}
    </List>
  );
}

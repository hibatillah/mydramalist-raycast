import {
  Action,
  ActionPanel,
  getPreferenceValues,
  Grid,
  Icon,
  Keyboard,
  List,
} from "@raycast/api";
import { useCachedState, usePromise } from "@raycast/utils";
import { useMemo, useState } from "react";
import { DetailDrama } from "./components/detail-page";
import { DetailProgress } from "./components/detail-progress";
import { removeFromWatchlist } from "./lib/actions";
import { GRID_LAYOUT_SIZE, PAGE_SIZE } from "./lib/constants";
import { DRAMAS } from "./lib/data";
import { Drama, WatchlistFilter } from "./lib/types";
import { sleep } from "./lib/utils";

type SetFiltering = (filtering: WatchlistFilter) => void;

function FilterDropdown({
  layout,
  setFiltering,
}: {
  layout: "list" | "grid";
  setFiltering: SetFiltering;
}) {
  const Comp = layout === "grid" ? Grid : List;

  return (
    <Comp.Dropdown
      tooltip="Filter Search"
      onChange={(value) => setFiltering(value as WatchlistFilter)}
      storeValue
      throttle>
      <Comp.Dropdown.Item value="all" title="All" />
      <Comp.Dropdown.Item value="watching" title="Currently Watching" />
      <Comp.Dropdown.Item value="completed" title="Completed" />
      <Comp.Dropdown.Item value="on-hold" title="On Hold" />
      <Comp.Dropdown.Item value="dropped" title="Dropped" />
      <Comp.Dropdown.Item value="plan-to-watch" title="Plan to Watch" />
      <Comp.Dropdown.Item value="undecided" title="Undecided" />
      <Comp.Dropdown.Item value="not-interested" title="Not Interested" />
    </Comp.Dropdown>
  );
}

function ItemActions({
  data,
  selected,
  revalidate,
}: {
  data: Drama;
  selected?: Drama;
  revalidate: ReturnType<typeof usePromise>["revalidate"];
}) {
  return (
    <ActionPanel>
      <ActionPanel.Section title={selected?.title ?? ""}>
        <Action.Push
          title="Update Progress"
          target={<DetailProgress data={data} />}
          icon={Icon.Pencil}
        />
        <Action.Push
          title="See Detail"
          target={<DetailDrama data={data} />}
          icon={Icon.Info}
        />
        <Action.OpenInBrowser
          title="Open Detail in Browser"
          url={data.link}
          shortcut={Keyboard.Shortcut.Common.Open}
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
        <Action.OpenInBrowser
          title="Open Watchlist in Browser"
          url="https://mydramalist.com/dramalist"
        />
        <Action
          title="Refresh Watchlist"
          icon={Icon.RotateClockwise}
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={() => revalidate()}
        />
      </ActionPanel.Section>
      <ActionPanel.Section>
        <Action
          title="Remove from Watchlist"
          onAction={async () => await removeFromWatchlist(data)}
          icon={Icon.XMarkCircle}
          style={Action.Style.Destructive}
          shortcut={Keyboard.Shortcut.Common.Remove}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

function WatchlistItem({
  item,
  layout,
  selected,
  revalidate,
}: {
  item: Drama;
  layout: "list" | "grid";
  selected?: Drama;
  revalidate: ReturnType<typeof usePromise>["revalidate"];
}) {
  const type = useMemo(
    () => item.type.charAt(0).toUpperCase() + item.type.slice(1),
    [item.type],
  );

  const status = useMemo(
    () =>
      item.watchedStatus.charAt(0).toUpperCase() + item.watchedStatus.slice(1),
    [item.watchedStatus],
  );

  const subtitle = useMemo(() => {
    if (item.type === "movie" || item.watchedStatus !== "watching") {
      return status;
    }
    return `Episodes ${item.episodesWatched ?? 0} / ${item.episodes}`;
  }, [
    item.type,
    item.watchedStatus,
    item.episodesWatched,
    item.episodes,
    status,
  ]);

  const actions = (
    <ItemActions data={item} selected={selected} revalidate={revalidate} />
  );

  if (layout === "grid") {
    return (
      <Grid.Item
        key={item.id}
        id={item.id}
        title={item.title}
        subtitle={subtitle}
        content={item.icon}
        actions={actions}
      />
    );
  }

  return (
    <List.Item
      key={item.id}
      id={item.id}
      icon={item.icon}
      title={item.title}
      subtitle={subtitle}
      accessories={[
        { icon: Icon.Tag, text: type },
        { icon: Icon.Calendar, text: item.airedYear?.toString() ?? "N/A" },
        {
          icon: Icon.Star,
          text: item.score?.toString() ?? "0",
          tooltip: "Your Score",
        },
      ]}
      actions={actions}
    />
  );
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences.ManageWatchlist>();
  const layout = preferences.watchlistViewLayout;
  const gridSize = preferences.gridLayoutSize;

  const placeholder = "Find dramas and movies from your watchlist";
  const emptyTitle = "No drama or movie in this list";
  const emptyDescription = "Try adding some dramas to your watchlist";

  const [filtering, setFiltering] = useState<WatchlistFilter>("all");
  const [searchText, setSearchText] = useCachedState<string>(
    "manage-watchlist",
    "",
  );

  const { isLoading, data, pagination, revalidate } = usePromise(
    (searchText: string, filtering: WatchlistFilter) =>
      async (options: { page: number }) => {
        await sleep();
        const data = DRAMAS;
        // const { data } = useFetch<Drama[]>(
        //   "https://api.mydramalist.com",
        // );

        const filtered = data
          .filter((item) =>
            item.title.toLowerCase().includes(searchText.toLowerCase()),
          )
          .filter((item) =>
            filtering !== "all" ? item.watchedStatus === filtering : item,
          );

        return { data: filtered, hasMore: options.page < PAGE_SIZE };
      },
    [searchText, filtering],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = useMemo(
    () => data?.find((item) => item.id === selectedId),
    [selectedId, data],
  );

  if (layout === "grid") {
    return (
      <Grid
        aspectRatio="3/4"
        columns={GRID_LAYOUT_SIZE[gridSize]}
        searchBarPlaceholder={placeholder}
        searchBarAccessory={
          <FilterDropdown layout="grid" setFiltering={setFiltering} />
        }
        selectedItemId={selectedId ?? undefined}
        onSelectionChange={(value) => setSelectedId(value ?? "")}
        onSearchTextChange={setSearchText}
        pagination={pagination}>
        {data && data.length > 0 ? (
          data.map((item) => (
            <WatchlistItem
              key={item.id}
              item={item}
              layout="grid"
              selected={selectedItem}
              revalidate={revalidate}
            />
          ))
        ) : (
          <Grid.EmptyView
            icon={Icon.Tray}
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </Grid>
    );
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder={placeholder}
      searchBarAccessory={
        <FilterDropdown layout="list" setFiltering={setFiltering} />
      }
      selectedItemId={selectedId ?? undefined}
      onSelectionChange={(value) => setSelectedId(value ?? "")}
      onSearchTextChange={setSearchText}
      pagination={pagination}>
      {data && data.length > 0 ? (
        data.map((item) => (
          <WatchlistItem
            key={item.id}
            item={item}
            layout="list"
            selected={selectedItem}
            revalidate={revalidate}
          />
        ))
      ) : (
        <List.EmptyView
          icon={Icon.Tray}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </List>
  );
}

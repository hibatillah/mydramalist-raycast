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

function ListFilter({ setFiltering }: { setFiltering: SetFiltering }) {
  return (
    <List.Dropdown
      tooltip="Filter Search"
      storeValue
      onChange={(value) => setFiltering(value as WatchlistFilter)}>
      <List.Dropdown.Item value="all" title="All" />
      <List.Dropdown.Item value="watching" title="Currently Watching" />
      <List.Dropdown.Item value="completed" title="Completed" />
      <List.Dropdown.Item value="on-hold" title="On Hold" />
      <List.Dropdown.Item value="dropped" title="Dropped" />
      <List.Dropdown.Item value="plan-to-watch" title="Plan to Watch" />
      <List.Dropdown.Item value="undecided" title="Undecided" />
      <List.Dropdown.Item value="not-interested" title="Not Interested" />
    </List.Dropdown>
  );
}

function GridFilter({ setFiltering }: { setFiltering: SetFiltering }) {
  return (
    <Grid.Dropdown
      tooltip="Filter Search"
      storeValue
      onChange={(value) => setFiltering(value as WatchlistFilter)}>
      <Grid.Dropdown.Item value="all" title="All" />
      <Grid.Dropdown.Item value="watching" title="Currently Watching" />
      <Grid.Dropdown.Item value="completed" title="Completed" />
      <Grid.Dropdown.Item value="on-hold" title="On Hold" />
      <Grid.Dropdown.Item value="dropped" title="Dropped" />
      <Grid.Dropdown.Item value="plan-to-watch" title="Plan to Watch" />
      <Grid.Dropdown.Item value="undecided" title="Undecided" />
      <Grid.Dropdown.Item value="not-interested" title="Not Interested" />
    </Grid.Dropdown>
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
          shortcut={Keyboard.Shortcut.Common.Copy}
        />
        <Action.CopyToClipboard title="Copy Title" content={data.title} />
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

function ListItem({
  item,
  selected,
  revalidate,
}: {
  item: Drama;
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

  return (
    <List.Item
      key={item.id}
      id={item.id}
      icon={item.icon}
      title={item.title}
      subtitle={subtitle}
      accessories={[
        {
          icon: Icon.Tag,
          text: type,
        },
        {
          icon: Icon.Calendar,
          text: item.airedYear?.toString() ?? "N/A",
        },
        {
          icon: Icon.Star,
          text: item.score?.toString() ?? "0",
          tooltip: "Your Score",
        },
      ]}
      actions={
        <ItemActions data={item} selected={selected} revalidate={revalidate} />
      }
    />
  );
}

function GridItem({
  item,
  selected,
  revalidate,
}: {
  item: Drama;
  selected?: Drama;
  revalidate: ReturnType<typeof usePromise>["revalidate"];
}) {
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

  return (
    <Grid.Item
      key={item.id}
      id={item.id}
      title={item.title}
      subtitle={subtitle}
      content={item.icon}
      actions={
        <ItemActions data={item} selected={selected} revalidate={revalidate} />
      }
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

  return layout === "grid" ? (
    <Grid
      aspectRatio="3/4"
      columns={GRID_LAYOUT_SIZE[gridSize]}
      searchBarPlaceholder={placeholder}
      searchBarAccessory={<GridFilter setFiltering={setFiltering} />}
      selectedItemId={selectedId ?? undefined}
      onSelectionChange={(value) => setSelectedId(value ?? "")}
      onSearchTextChange={setSearchText}
      pagination={pagination}>
      {data && data.length > 0 ? (
        data.map((item) => (
          <GridItem
            key={item.id}
            item={item}
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
  ) : (
    <List
      isLoading={isLoading}
      searchBarPlaceholder={placeholder}
      searchBarAccessory={<ListFilter setFiltering={setFiltering} />}
      selectedItemId={selectedId ?? undefined}
      onSelectionChange={(value) => setSelectedId(value ?? "")}
      onSearchTextChange={setSearchText}
      pagination={pagination}>
      {data && data.length > 0 ? (
        data.map((item) => (
          <ListItem
            key={item.id}
            item={item}
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

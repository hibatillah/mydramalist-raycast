import {
  Action,
  ActionPanel,
  getPreferenceValues,
  Grid,
  Icon,
  Keyboard,
  List,
} from "@raycast/api";
import { useCachedState, useFetch, usePromise } from "@raycast/utils";
import { useMemo, useState } from "react";
import { DetailDrama } from "./components/detail-page";
import { DetailProgress } from "./components/detail-progress";
import { GRID_LAYOUT_SIZE, PAGE_SIZE } from "./lib/constants";
import { DRAMAS } from "./lib/data";
import { Drama, SearchFilter } from "./lib/types";
import { sleep } from "./lib/utils";

type SetFiltering = (filtering: SearchFilter) => void;

function ListFilter({ setFiltering }: { setFiltering: SetFiltering }) {
  return (
    <List.Dropdown
      tooltip="Filter Search"
      onChange={(value) => setFiltering(value as SearchFilter)}>
      <List.Dropdown.Item value="all" title="All" />
      <List.Dropdown.Section title="Type">
        <List.Dropdown.Item value="drama" title="Drama" />
        <List.Dropdown.Item value="movie" title="Movie" />
        <List.Dropdown.Item value="show" title="TV Show" />
      </List.Dropdown.Section>
      <List.Dropdown.Section title="Status">
        <List.Dropdown.Item value="ongoing" title="Ongoing" />
        <List.Dropdown.Item value="completed" title="Completed" />
        <List.Dropdown.Item value="upcoming" title="Upcoming" />
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

function GridFilter({ setFiltering }: { setFiltering: SetFiltering }) {
  return (
    <Grid.Dropdown
      tooltip="Filter Search"
      onChange={(value) => setFiltering(value as SearchFilter)}>
      <Grid.Dropdown.Item value="all" title="All" />
      <Grid.Dropdown.Section title="Type">
        <Grid.Dropdown.Item value="drama" title="Drama" />
        <Grid.Dropdown.Item value="movie" title="Movie" />
        <Grid.Dropdown.Item value="show" title="TV Show" />
      </Grid.Dropdown.Section>
      <Grid.Dropdown.Section title="Status">
        <Grid.Dropdown.Item value="ongoing" title="Ongoing" />
        <Grid.Dropdown.Item value="completed" title="Completed" />
        <Grid.Dropdown.Item value="upcoming" title="Upcoming" />
      </Grid.Dropdown.Section>
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
  revalidate: ReturnType<typeof useFetch>["revalidate"];
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
      </ActionPanel.Section>
      <ActionPanel.Section>
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
          shortcut={Keyboard.Shortcut.Common.Copy}
        />
        <Action.CopyToClipboard title="Copy Title" content={data.title} />
      </ActionPanel.Section>
      <ActionPanel.Section>
        <Action
          title="Refresh Data"
          icon={Icon.RotateClockwise}
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={() => revalidate()}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences.SearchDrama>();
  const layout = preferences.searchViewLayout;
  const gridSize = preferences.gridLayoutSize;

  const placeholder = "Find dramas, movies, actors and more...";
  const emptyTitle = "No drama or movie found";
  const emptyDescription =
    "Try searching for other dramas, movies and actors...";

  const [filtering, setFiltering] = useState<SearchFilter>("all");
  const [searchText, setSearchText] = useCachedState<string>(
    "search-drama",
    "",
  );

  const { isLoading, data, pagination, revalidate } = usePromise(
    (searchText: string, filtering: SearchFilter) =>
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
            filtering !== "all"
              ? item.type === filtering || item.status === filtering
              : item,
          );

        return { data: filtered, hasMore: options.page < PAGE_SIZE };
      },
    [searchText, filtering],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = useMemo(
    () => (data ? data.find((item) => item.id === selectedId) : undefined),
    [selectedId, data],
  );

  return layout === "grid" ? (
    <Grid
      isLoading={isLoading}
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
          <Grid.Item
            key={item.id}
            id={item.id}
            title={item.title}
            subtitle={`${item.airedYear} • ${item.country} `}
            content={item.icon}
            actions={
              <ItemActions
                data={item}
                selected={selectedItem}
                revalidate={revalidate}
              />
            }
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
          <List.Item
            key={item.id}
            id={item.id}
            icon={item.icon}
            title={item.title}
            subtitle={`${item.country} • ${item.airedYear} ${item.type !== "movie" ? `• ${item.episodes} episodes` : ""}`}
            accessories={[
              {
                icon: Icon.Clock,
                text: item.duration ?? "N/A",
              },
              {
                icon: Icon.Star,
                text: item.score?.toString() ?? "0",
              },
            ]}
            actions={
              <ItemActions
                data={item}
                selected={selectedItem}
                revalidate={revalidate}
              />
            }
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

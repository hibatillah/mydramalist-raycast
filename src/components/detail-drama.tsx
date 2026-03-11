import { Action, ActionPanel, Detail } from "@raycast/api";
import { Drama } from "../utils/types";

export function DetailDrama({ data }: { data: Drama }) {
  const markdown = `
  # ${data.title}

  Ratings: ${data.score}

  Ranked: #${data.ranked}

  Popularity: #${data.popularity}

  Watchers: ${data.watchers}

  Cast: ${data.cast.slice(0, 6).join(", ")}

  ${data.description}
  `;

  return (
    <Detail
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text={data.type} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.TagList title="Genres">
            {data.genres.map((genre) => (
              <Detail.Metadata.TagList.Item key={genre} text={genre} />
            ))}
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label title="Country" text={data.country} />
          <Detail.Metadata.Label
            title="Duration"
            text={data.duration ?? "N/A"}
          />
          {data.type !== "movie" && (
            <Detail.Metadata.Label
              title="Episodes"
              text={data.episodes?.toString() ?? "N/A"}
            />
          )}
          {data.aired ? (
            <Detail.Metadata.Label title="Aired" text={data.aired ?? "N/A"} />
          ) : (
            <Detail.Metadata.Label title="Airs" text={data.airs ?? "N/A"} />
          )}
          {data.type !== "movie" && data.airedOn && (
            <Detail.Metadata.Label
              title="Aired On"
              text={data.airedOn ?? "N/A"}
            />
          )}
          <Detail.Metadata.Label
            title="Original Network"
            text={data.originalNetwork ?? "N/A"}
          />
          {data.externalLink && data.externalLink.length > 0 && (
            <>
              <Detail.Metadata.Separator />
              {data.externalLink.map((item) => (
                <Detail.Metadata.Link
                  key={item.title}
                  title={item.title}
                  target={item.link}
                  text={item.text}
                />
              ))}
            </>
          )}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open in Browser" url={data.link} />
          <Action.CopyToClipboard title="Copy Page Link" content={data.link} />
          {data.externalLink && data.externalLink.length > 0 && (
            <ActionPanel.Section>
              {data.externalLink.map((item) => (
                <Action.OpenInBrowser
                  title={`Open in ${item.title}`}
                  url={item.link}
                />
              ))}
            </ActionPanel.Section>
          )}
        </ActionPanel>
      }
    />
  );
}

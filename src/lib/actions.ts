import { Alert, confirmAlert, showToast, Toast } from "@raycast/api";
import { Drama, ProgressForm } from "./types";
import { sleep } from "./utils";

export async function updateProgress(values: ProgressForm) {
  await sleep();
}

export async function removeFromWatchlist(data: Drama) {
  const options: Alert.Options = {
    title: `Remove your watchlist?`,
    message: `Remove ${data.title} from your watchlist?`,
    primaryAction: {
      title: "Remove",
      onAction: async () => {
        const toast = await showToast({
          style: Toast.Style.Animated,
          title: "Removing from watchlist",
        });

        try {
          // mutation
          await sleep();

          toast.style = Toast.Style.Success;
          toast.title = "Removed from watchlist";
        } catch (error) {
          toast.style = Toast.Style.Failure;
          toast.title = "Failed to remove from watchlist";
          toast.message = "Please try again";
        }
      },
      style: Alert.ActionStyle.Destructive,
    },
  };

  await confirmAlert(options);
}

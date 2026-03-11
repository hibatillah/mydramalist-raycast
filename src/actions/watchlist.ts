import { Alert, confirmAlert, showToast, Toast } from "@raycast/api";
import { Drama } from "../utils/types";

export default async function removeFromWatchlist(data: Drama) {
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
          await new Promise((resolve) => setTimeout(resolve, 1000));

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

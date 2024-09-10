import { OnInit, Service } from "@flamework/core";
import { Logger } from "@rbxts/log";
import Object from "@rbxts/object-utils";
import { MarketplaceService, Players } from "@rbxts/services";
import { DeveloperProducts } from "./Products";

@Service({})
export default class DevProducts implements OnInit {
	/** @ignore */
	constructor(private readonly logger: Logger) {}

	onInit(): void | Promise<void> {
		MarketplaceService.ProcessReceipt = (receipt) => {
			const result = this.processReceipt(receipt).expect();
			this.logger.Info(
				"Processing receipt for Player {@Player}: {@Decision}",
				Players.GetPlayerByUserId(receipt.PlayerId),
				result.Name,
			);
			return result;
		};
	}

	private async getItem() {}
	private async grantItem() {}

	private async processReceipt(receipt: ReceiptInfo): Promise<Enum.ProductPurchaseDecision> {
		const player = Players.GetPlayerByUserId(receipt.PlayerId);
		if (player === undefined) {
			this.logger.Info("Player entity does not exist");
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		if (!Object.values(DeveloperProducts).includes(receipt.ProductId)) {
			this.logger.Info(`Product does not exist: ${receipt.ProductId} by ${receipt.PlayerId}`);
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		return Enum.ProductPurchaseDecision.PurchaseGranted;
	}
}

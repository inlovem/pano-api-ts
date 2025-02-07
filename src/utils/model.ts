export function getId(modelOrId: any) {
	if (['number', 'string'].includes(typeof modelOrId)) {
		return modelOrId;
	} else {
		const model = modelOrId;

		return model.id;
	}
}


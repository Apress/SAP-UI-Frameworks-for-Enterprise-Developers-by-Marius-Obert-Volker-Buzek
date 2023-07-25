export const DefaultTypeForEdmType = {
	"Edm.Binary": {
		modelType: undefined
	},
	"Edm.Boolean": {
		modelType: "Bool"
	},
	"Edm.Byte": {
		modelType: "Int"
	},
	"Edm.Date": {
		modelType: "Date"
	},
	"Edm.DateTime": {
		modelType: "Date"
	},
	"Edm.DateTimeOffset": {
		modelType: "DateTimeOffset"
	},
	"Edm.Decimal": {
		modelType: "Decimal"
	},
	"Edm.Duration": {
		modelType: undefined
	},
	"Edm.Double": {
		modelType: "Float"
	},
	"Edm.Float": {
		modelType: "Float"
	},
	"Edm.Guid": {
		modelType: "Guid"
	},
	"Edm.Int16": {
		modelType: "Int"
	},
	"Edm.Int32": {
		modelType: "Int"
	},
	"Edm.Int64": {
		modelType: "Int"
	},
	"Edm.SByte": {
		modelType: "Int"
	},
	"Edm.Single": {
		modelType: "Float"
	},
	"Edm.String": {
		modelType: "String"
	},
	"Edm.Time": {
		modelType: "TimeOfDay"
	},
	"Edm.TimeOfDay": {
		modelType: "TimeOfDay"
	},
	"Edm.Stream": {
		modelType: undefined
	}
};

export function isTypeFilterable(edmType: keyof typeof DefaultTypeForEdmType) {
	return !!DefaultTypeForEdmType[edmType]?.modelType;
}

export function getModelType(edmType: keyof typeof DefaultTypeForEdmType) {
	return DefaultTypeForEdmType[edmType]?.modelType;
}

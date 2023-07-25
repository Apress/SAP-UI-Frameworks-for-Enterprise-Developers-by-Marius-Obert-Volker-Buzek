import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import Core from "sap/ui/core/Core";
import ODataStringType from "sap/ui/model/odata/type/String";
import ValidateException from "sap/ui/model/ValidateException";

const emailW3CRegexp = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/;
@defineUI5Class("sap.fe.core.type.Email")
class EmailType extends ODataStringType {
	validateValue(sValue: string) {
		if (!emailW3CRegexp.test(sValue)) {
			throw new ValidateException(Core.getLibraryResourceBundle("sap.fe.core").getText("T_EMAILTYPE_INVALID_VALUE"));
		}
		super.validateValue(sValue);
	}
}
export default EmailType;

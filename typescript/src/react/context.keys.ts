/**
 * Specifies keys for the definition and retrieval of local contexts within the React extension of the TS LCE.
 *
 * (see also "Local Contexts" in the developer documentation)
 */
export class ReactContextKeys {

    /**
     * List of JSX tags that is used in some environment, e.g. inside the code of a function (`Array<LCEJSXDependency>`)
     */
    public static readonly JSX_DEPENDENCIES = "jsx-dependency-context";

}

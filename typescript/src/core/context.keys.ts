/**
 * Specifies keys for the definition and retrieval of local contexts within the core part of the TS LCE.
 *
 * (see also "Local Contexts" in the developer documentation)
 */
export class CoreContextKeys {

    /**
     * `TraverserContext` instance for each currently traversed node layer.
     * This context is always present, one for each node layer.
     */
    public static readonly TRAVERSER_CONTEXT = "~traverser";

    // === Declaration Processing ===

    /**
     * Flag indicating, whether members of an enum should be processed (`boolean`)
     */
    public static readonly ENUM_MEMBERS_PROCESSING_FLAG = "process-enum-members";

    /**
     * Predetermined native type (via TypeChecker) of a function declaration that may be used for further processing.
     * The presence of this context is also implicitly used to trigger the processing of nested parameter nodes.
     */
    public static readonly FUNCTION_TYPE = "function-type";

    /**
     * Predetermined native type (via TypeChecker) of a method declaration/signature that may be used for further processing.
     * The presence of this context is also implicitly used to trigger the processing of nested parameter nodes.
     */
    public static readonly METHOD_TYPE = "method-type";

    /**
     * Flag indicating, whether members of a class or interface should be processed. (`number`)
     *
     * The number indicates at which depth the child nodes of the members may occur (`1` for direct children, `2` for grand-children, etc.)
     */
    public static readonly PROCESS_CLASS_LIKE_MEMBERS = "process-members";

    /**
     * Flag indicating, whether parameters of a function or method should be processed. (`number`)
     *
     * The number indicates at which depth the child nodes of the parameters may occur (`1` for direct children, `2` for grand-children, etc.)
     */
    public static readonly PROCESS_PARAMETERS = "process-parameters";


    // === Dependency and FQN resolution ===

    /**
     * Dependency index used for registering all declarations made within a module (`DeclarationIndex`)
     */
    public static readonly DECLARATION_INDEX = "declaration-index";

    /**
     * Current scope object, used to introduce new FQN scoping levels (`FQNScope`)
     */
    public static readonly FQN_SCOPE = "fqn-scope";

    /**
     * FQN resolver index, used to schedule FQN resolutions (`FQNResolverContext`)
     */
    public static readonly FQN_RESOLVER = "fqn-resolver";

    /**
     * FQN of the declaration that any newly discovered dependencies are added to (`string`)
     */
    public static readonly DEPENDENCY_GLOBAL_SOURCE_FQN = "dependency-global-fqn";

    /**
     * Dependency index of the current dependency fqn (`Array<LCEDependency>`)
     */
    public static readonly DEPENDENCY_INDEX = "dependency-index";

    /**
     * Identifier of the declaration that is default-exported in the current module (not used for inline default exports, e.g. `export default class MyClass { ... }`)
     */
    public static readonly DEFAULT_EXPORT_IDENTIFIER = "default-export-identifier-context"


    // === Value Processing ===

    /**
     * Flag indicating, whether value child nodes should be processed to actual value concepts (`boolean`)
     */
    public static readonly VALUE_PROCESSING_FLAG = "process-values";

    /**
     * Integer used to trigger the FQN resolution of identifiers within (stacked) member value expressions (`number`)
     */
    public static readonly DO_NOT_RESOLVE_IDENTIFIER_FLAG = "do-not-resolve-value-identifier";
}

import { AST_NODE_TYPES } from "@typescript-eslint/types";
import { Processor } from "./processor";
import {
    ClassDeclarationProcessor,
    ImplementsDeclarationProcessor,
    SuperClassDeclarationProcessor
} from "./processors/class-declaration.processor";
import {
    AutoAccessorDeclarationProcessor,
    MethodParameterProcessor,
    MethodProcessor,
    PropertyProcessor
} from "./processors/class-like-declaration.processor";
import { DecoratorProcessor } from "./processors/decorator.processor";
import { DependencyResolutionProcessor } from "./processors/dependency-resolution.processor";
import { EnumDeclarationProcessor, EnumMemberProcessor } from "./processors/enum-declaration.processor";
import { ExportDeclarationProcessor } from "./processors/export-declaration.processor";
import { FunctionDeclarationProcessor, FunctionParameterProcessor } from "./processors/function-declaration.processor";
import { ImportDeclarationProcessor } from "./processors/import-declaration.processor";
import {
    DeclarationScopeProcessor,
    IdentifierDependencyProcessor,
    MemberExpressionDependencyProcessor,
    ScopeProcessor
} from "./processors/instructional-code.processor";
import {
    InterfaceDeclarationProcessor,
    SuperInterfaceDeclarationProcessor
} from "./processors/interface-declaration.processor";
import { TypeAliasDeclarationProcessor } from "./processors/type-alias-declaration.processor";
import {
    ArrayValueProcessor,
    CallValueProcessor,
    ClassValueProcessor,
    ComplexValueProcessor,
    FunctionValueProcessor,
    IdentifierValueProcessor,
    LiteralValueProcessor,
    MemberValueProcessor,
    ObjectValueProcessor,
    ObjectValuePropertyProcessor
} from "./processors/value.processor";
import { VariableDeclarationProcessor, VariableDeclaratorProcessor } from "./processors/variable-declaration.processor";
import { SimpleTraverser, Traverser } from "./traverser";
import { ClassTraverser, StaticBlockTraverser } from "./traversers/class.traverser";
import { DecoratorTraverser } from "./traversers/decorator.traverser";
import { EnumDeclarationTraverser, EnumMemberTraverser } from "./traversers/enum.traverser";
import {
    ExportAssignmentTraverser,
    ExportDefaultDeclarationTraverser,
    ExportNamedDeclarationTraverser
} from "./traversers/export-declaration.traverser";
import {
    ArrayExpressionTraverser,
    ArrayPatternTraverser,
    ArrowFunctionExpressionTraverser,
    AsExpressionTraverser,
    AssignmentExpressionTraverser,
    AwaitExpressionTraverser,
    BinaryExpressionTraverser,
    CallExpressionTraverser,
    ChainExpressionTraverser,
    ConditionalExpressionTraverser,
    IdentifierTraverser,
    ImportExpressionTraverser,
    LogicalExpressionTraverser,
    MemberExpressionTraverser,
    NewExpressionTraverser,
    NonNullExpressionTraverser,
    ObjectExpressionTraverser,
    ObjectPatternTraverser,
    SequenceExpressionTraverser,
    SpreadElementTraverser,
    TaggedTemplateExpressionTraverser,
    TemplateLiteralTraverser,
    TypeAssertionTraverser,
    UnaryExpressionTraverser,
    UpdateExpressionTraverser,
    YieldExpressionTraverser
} from "./traversers/expression.traverser";
import { FunctionTraverser } from "./traversers/function.traverser";
import {
    InterfaceDeclarationTraverser,
    InterfaceHeritageTraverser
} from "./traversers/interface-declaration.traverser";
import { MethodTraverser, ParameterPropertyTraverser } from "./traversers/method.traverser";
import { ProgramTraverser } from "./traversers/program.traverser";
import { AccessorPropertyTraverser, PropertyTraverser } from "./traversers/property.traverser";
import {
    BlockStatementTraverser,
    DoWhileStatementTraverser,
    ExpressionStatementTraverser,
    ForInStatementTraverser,
    ForOfStatementTraverser,
    ForStatementTraverser,
    IfStatementTraverser,
    LabeledStatementTraverser,
    ReturnStatementTraverser,
    SwitchCaseTraverser,
    SwitchStatementTraverser,
    ThrowStatementTraverser,
    TryStatementTraverser,
    WhileStatementTraverser,
    WithStatementTraverser
} from "./traversers/statement.traverser";
import { TypeAliasDeclarationTraverser } from "./traversers/type-alias-declaration.traverser";
import {
    TypeParameterDeclarationTraverser,
    TypeParameterInstantiationTraverser,
    TypeParameterTraverser
} from "./traversers/type-parameter.traverser";
import { VariableDeclarationTraverser, VariableDeclaratorTraverser } from "./traversers/variable-declaration.traverser";
import { ModuleProcessor } from "./processors/typescript-module.processor";
import { PostProcessor } from "./post-processor";
import { ExternalDependenciesPostProcessor } from "./post-processors/external-dependencies.post-processor";

/**
 * Central index of all traversers natively supported by the LCE.
 * Maps AST node types to their corresponding traverser.
 */
export const TRAVERSERS: Map<AST_NODE_TYPES, Traverser> = new Map([
    [AST_NODE_TYPES.AccessorProperty, new AccessorPropertyTraverser()],
    [AST_NODE_TYPES.ArrayExpression, new ArrayExpressionTraverser()],
    [AST_NODE_TYPES.ArrayPattern, new ArrayPatternTraverser()],
    [AST_NODE_TYPES.ArrowFunctionExpression, new ArrowFunctionExpressionTraverser()],
    [AST_NODE_TYPES.AssignmentExpression, new AssignmentExpressionTraverser()],
    [AST_NODE_TYPES.AwaitExpression, new AwaitExpressionTraverser()],
    [AST_NODE_TYPES.BinaryExpression, new BinaryExpressionTraverser()],
    [AST_NODE_TYPES.BlockStatement, new BlockStatementTraverser()],
    [AST_NODE_TYPES.CallExpression, new CallExpressionTraverser()],
    [AST_NODE_TYPES.ChainExpression, new ChainExpressionTraverser()],
    [AST_NODE_TYPES.ClassDeclaration, new ClassTraverser()],
    [AST_NODE_TYPES.ClassExpression, new ClassTraverser()],
    [AST_NODE_TYPES.ConditionalExpression, new ConditionalExpressionTraverser()],
    [AST_NODE_TYPES.Decorator, new DecoratorTraverser()],
    [AST_NODE_TYPES.DoWhileStatement, new DoWhileStatementTraverser()],
    [AST_NODE_TYPES.ExportAllDeclaration, new SimpleTraverser()],
    [AST_NODE_TYPES.ExportDefaultDeclaration, new ExportDefaultDeclarationTraverser()],
    [AST_NODE_TYPES.ExportNamedDeclaration, new ExportNamedDeclarationTraverser()],
    [AST_NODE_TYPES.ExpressionStatement, new ExpressionStatementTraverser()],
    [AST_NODE_TYPES.ForInStatement, new ForInStatementTraverser()],
    [AST_NODE_TYPES.ForOfStatement, new ForOfStatementTraverser()],
    [AST_NODE_TYPES.ForStatement, new ForStatementTraverser()],
    [AST_NODE_TYPES.FunctionDeclaration, new FunctionTraverser()],
    [AST_NODE_TYPES.FunctionExpression, new FunctionTraverser()],
    [AST_NODE_TYPES.Identifier, new IdentifierTraverser()],
    [AST_NODE_TYPES.IfStatement, new IfStatementTraverser()],
    [AST_NODE_TYPES.ImportDeclaration, new SimpleTraverser()],
    [AST_NODE_TYPES.ImportExpression, new ImportExpressionTraverser()],
    [AST_NODE_TYPES.LabeledStatement, new LabeledStatementTraverser()],
    [AST_NODE_TYPES.Literal, new SimpleTraverser()],
    [AST_NODE_TYPES.LogicalExpression, new LogicalExpressionTraverser()],
    [AST_NODE_TYPES.MemberExpression, new MemberExpressionTraverser()],
    [AST_NODE_TYPES.MethodDefinition, new MethodTraverser()],
    [AST_NODE_TYPES.NewExpression, new NewExpressionTraverser()],
    [AST_NODE_TYPES.ObjectExpression, new ObjectExpressionTraverser()],
    [AST_NODE_TYPES.ObjectPattern, new ObjectPatternTraverser()],
    [AST_NODE_TYPES.Program, new ProgramTraverser()],
    [AST_NODE_TYPES.Property, new PropertyTraverser()],
    [AST_NODE_TYPES.PropertyDefinition, new PropertyTraverser()],
    [AST_NODE_TYPES.ReturnStatement, new ReturnStatementTraverser()],
    [AST_NODE_TYPES.SequenceExpression, new SequenceExpressionTraverser()],
    [AST_NODE_TYPES.SpreadElement, new SpreadElementTraverser()],
    [AST_NODE_TYPES.StaticBlock, new StaticBlockTraverser()],
    [AST_NODE_TYPES.SwitchCase, new SwitchCaseTraverser()],
    [AST_NODE_TYPES.SwitchStatement, new SwitchStatementTraverser()],
    [AST_NODE_TYPES.TaggedTemplateExpression, new TaggedTemplateExpressionTraverser()],
    [AST_NODE_TYPES.TemplateLiteral, new TemplateLiteralTraverser()],
    [AST_NODE_TYPES.ThrowStatement, new ThrowStatementTraverser()],
    [AST_NODE_TYPES.TryStatement, new TryStatementTraverser()],
    [AST_NODE_TYPES.TSAbstractAccessorProperty, new AccessorPropertyTraverser()],
    [AST_NODE_TYPES.TSAbstractMethodDefinition, new MethodTraverser()],
    [AST_NODE_TYPES.TSAbstractPropertyDefinition, new PropertyTraverser()],
    [AST_NODE_TYPES.TSAsExpression, new AsExpressionTraverser()],
    [AST_NODE_TYPES.TSClassImplements, new SimpleTraverser()],
    [AST_NODE_TYPES.TSDeclareFunction, new FunctionTraverser()],
    [AST_NODE_TYPES.TSEnumDeclaration, new EnumDeclarationTraverser()],
    [AST_NODE_TYPES.TSEnumMember, new EnumMemberTraverser()],
    [AST_NODE_TYPES.TSExportAssignment, new ExportAssignmentTraverser()],
    [AST_NODE_TYPES.TSInterfaceDeclaration, new InterfaceDeclarationTraverser()],
    [AST_NODE_TYPES.TSInterfaceHeritage, new InterfaceHeritageTraverser()],
    [AST_NODE_TYPES.TSMethodSignature, new MethodTraverser()],
    [AST_NODE_TYPES.TSNonNullExpression, new NonNullExpressionTraverser()],
    [AST_NODE_TYPES.TSParameterProperty, new ParameterPropertyTraverser()],
    [AST_NODE_TYPES.TSPropertySignature, new PropertyTraverser()],
    [AST_NODE_TYPES.TSTypeAliasDeclaration, new TypeAliasDeclarationTraverser()],
    [AST_NODE_TYPES.TSTypeAssertion, new TypeAssertionTraverser()],
    [AST_NODE_TYPES.TSTypeParameter, new TypeParameterTraverser()],
    [AST_NODE_TYPES.TSTypeParameterDeclaration, new TypeParameterDeclarationTraverser()],
    [AST_NODE_TYPES.TSTypeParameterInstantiation, new TypeParameterInstantiationTraverser()],
    [AST_NODE_TYPES.UnaryExpression, new UnaryExpressionTraverser()],
    [AST_NODE_TYPES.UpdateExpression, new UpdateExpressionTraverser()],
    [AST_NODE_TYPES.VariableDeclaration, new VariableDeclarationTraverser()],
    [AST_NODE_TYPES.VariableDeclarator, new VariableDeclaratorTraverser()],
    [AST_NODE_TYPES.WhileStatement, new WhileStatementTraverser()],
    [AST_NODE_TYPES.WithStatement, new WithStatementTraverser()],
    [AST_NODE_TYPES.YieldExpression, new YieldExpressionTraverser()],
]);

export const POST_PROCESSORS: PostProcessor[] = [
    new ExternalDependenciesPostProcessor()
];

/**
 * Central index of all processors provided natively by the LCE.
 */
export const PROCESSORS: Processor[] = [
    new ArrayValueProcessor(),
    new AutoAccessorDeclarationProcessor(),
    new CallValueProcessor(),
    new ClassDeclarationProcessor(),
    new ClassValueProcessor(),
    new ComplexValueProcessor(),
    new DeclarationScopeProcessor(),
    new DecoratorProcessor(),
    new DependencyResolutionProcessor(),
    new EnumDeclarationProcessor(),
    new EnumMemberProcessor(),
    new ExportDeclarationProcessor(),
    new FunctionDeclarationProcessor(),
    new FunctionParameterProcessor(),
    new FunctionValueProcessor(),
    new IdentifierDependencyProcessor(),
    new IdentifierValueProcessor(),
    new ImplementsDeclarationProcessor(),
    new ImportDeclarationProcessor(),
    new InterfaceDeclarationProcessor(),
    new LiteralValueProcessor(),
    new MemberExpressionDependencyProcessor(),
    new MemberValueProcessor(),
    new MethodParameterProcessor(),
    new MethodProcessor(),
    new ModuleProcessor(),
    new ObjectValueProcessor(),
    new ObjectValuePropertyProcessor(),
    new PropertyProcessor(),
    new ScopeProcessor(),
    new SuperClassDeclarationProcessor(),
    new SuperInterfaceDeclarationProcessor(),
    new TypeAliasDeclarationProcessor(),
    new VariableDeclarationProcessor(),
    new VariableDeclaratorProcessor(),
];

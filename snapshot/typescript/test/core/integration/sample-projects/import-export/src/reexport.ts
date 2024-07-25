
export * from './source1';
export {CustomType2Alias as CustomType2AliasAlias, CustomClass2, CustomInterface2 as CustomInterface2Alias, default as DefaultAlias2} from './source2';
export * as someNamespace from './source3';
export {DummyCustomInterface} from '../../external-dummy-project/src/source1';
export * from '../../external-dummy-project/src/source3';

export class SomeOtherClass {}

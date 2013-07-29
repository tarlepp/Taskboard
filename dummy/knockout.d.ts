module knockout {
    interface koSubscription {
        dispose();
    }
    interface koSubscribable {
        subscribe(callback: (newValue) => void , target? , event?: string): koSubscription;
    }
    interface koExtendOptions {
        throttle?: number;
    }
    interface koExtend {
        ();
        extend(options: koExtendOptions);
    }
    interface koBindingHandlersOptions {
        init?: (element? , valueAccessor? , allBindingsAccessor? , viewModel? , bindingContext? ) =>void;
        update?: (element? , valueAccessor? , allBindingsAccessor? , viewModel? , bindingContext? ) =>void;
    }
    interface koComputedOptions {
        read?: () =>any;
        write?: (value: any) =>void;
        owner?: any;
    }
    interface koComputedExtOptions extends koComputedOptions {
        disposeWhenNodeIsRemoved?: () =>any;
        disposeWhen?: () =>any;
    }
    interface koComputedExt extends koExtend {
        getDependenciesCount(): number;
        hasWriteFunction(): bool;
        subscribe(callback: (newValue) => void , target? , event?: string): koSubscription;
        dispose();
    }
    interface koComputed {
        (evaluator: () => any, target? , options?: koComputedExtOptions): koComputedExt;
        (initOptions: koComputedOptions, target? , options?: koComputedExtOptions): koComputedExt;
        (): any;
        peek(): any;
    };
    interface koObservableBase extends koExtend extends koSubscribable {
    valueHasMutated(): void;
    valueWillMutate(): void;
    peek(): any;
}
    interface koObservableNumber extends koObservableBase {
        (newValue: number): void;
        (): number;
        subscribe(callback: (newValue: number) => void , target? , event?: string): koSubscription;
        peek(): number;
    }
    interface koObservableString extends koObservableBase {
        (newValue: string): void;
        (): string;
        subscribe(callback: (newValue: string) => void , target? , event?: string): koSubscription;
        peek(): string;
    }
    interface koObservableBool extends koObservableBase {
        (newValue: bool): void;
        (): bool;
        subscribe(callback: (newValue: bool) => void , target? , event?: string): koSubscription;
        peek(): bool;
    }
    interface koObservableAny extends koObservableBase {
        (newValue: any): void;
        (): any;
    }
    interface koObservable {
        (value: number): koObservableNumber;
        (value: string): koObservableString;
        (value: bool): koObservableBool;
        (value: any): koObservableAny;
        ():koObservableAny;
    }
    interface koObservableArrayBase extends koObservableBase {
        (newValue: any[]): void;
        (): any[];
        subscribe(callback: (newValue: any[]) => void ): koSubscription;
        peek(): any[];

        pop(): any;
        push(...items: any[]): void;
        reverse(): any[];
        shift(): any;
        slice(start: number, end?: number): any[];
        sort(compareFn?: (a, b) => number): any[];
        splice(start: number): string[];
        splice(start: number, deleteCount: number, ...items: any[]): any[];
        unshift(...items: any[]): number;
        indexOf(item): number;

        remove(value): any;
        remove(predicate: (value) =>bool): any;
        removeAll();
        removeAll(arrayOfValues: any[]): any[];

        destroy(value);
        destroy(predicate: (value) =>bool): any;
        destroyAll();
        destroyAll(arrayOfValues: any[]): any[];
        replace(oldItem, newItem);
    }
    interface koObservableArray {
        (array: any[]): koObservableArrayBase;
        (): koObservableArrayBase;
    }

    export function applyBindings(viewModel? , rootNode?: HTMLElement);
    export function toJSON(viewModel, replacer? , space? ): string;
    export function toJS(viewModel): any;
    export function isObservable(obj): bool;
    export function isComputed(obj): bool;
    export function cleanNode(obj);

    export var observable: koObservable;
    export var computed: koComputed;
    export var dependentObservable: koComputed;
    export var observableArray: koObservableArray;
    export var extenders: (target: koObservableAny, option? ) =>koObservableAny;
    export var bindingHandlers: koBindingHandlersOptions;
};
module knockout.utils {
    export var fieldsIncludedWithJsonPost: any[];

    export function extend(target, source);
    export function arrayForEach(array: any[], action: (any) =>void );
    export function arrayIndexOf(array: any[], item: any);
    export function arrayFirst(array: any[], predicate: (item) =>bool, predicateOwner? ): any;
    export function arrayFilter(array: any[], predicate: (item) =>bool);
    export function arrayGetDistinctValues(array: any[]);
    export function arrayMap(array: any[], mapping: (item) =>any);
    export function arrayPushAll(array: any[], valuesToPush: any[]);
    export function arrayRemoveItem(array: any[], itemToRemove);
    export function getFormFields(form: HTMLFormElement, fieldName: string): HTMLElement[];
    export function parseJson(jsonString: string): any;
    export function registerEventHandler(element: HTMLElement, eventType: string, handler: (event: Event) =>void );
    export function stringifyJson(data, replacer? , space? );
    export function range(min: number, max: number);
    export function toggleDomNodeCssClass(node: HTMLElement, className: string, shouldHaveClass?: bool);
    export function triggerEvent(element: HTMLElement, eventType: string);
    export function unwrapObservable(value);
    export var domNodeDisposal: {
        addDisposeCallback(node, callback?: () =>void );
        removeDisposeCallback(node, callback?: () =>void );
        cleanNode(node);
        removeNode(node);
    }
}

declare var ko: knockout;
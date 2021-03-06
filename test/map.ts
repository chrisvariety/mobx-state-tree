import {ObservableMap} from 'mobx'
import {onSnapshot, onPatch, onAction, createFactory, applyPatch, applyPatches, applyAction, applyActions, _getNode, getPath, IJsonPatch, applySnapshot, action, getSnapshot, arrayOf, IModelFactory, mapOf} from "../"
import {test} from "ava"

interface ITestSnapshot{
    to: string
}

interface ITest{
    to: string
}

const createTestFactories = () => {
    const ItemFactory = createFactory({
            to: 'world'
        })

    const Factory = (mapOf(
        ItemFactory
    ) as any) as IModelFactory<{[key: string]: ITestSnapshot}, ObservableMap<ITest>>

    return {Factory, ItemFactory}
}

// === FACTORY TESTS ===
test("it should create a factory", (t) => {
    const {Factory} = createTestFactories()

    t.deepEqual<any>(getSnapshot<{[key: string]: ITestSnapshot}, ObservableMap<ITest>>(Factory()), {})
})

test("it should restore the state from the snapshot", (t) => {
    const {Factory} = createTestFactories()

    t.deepEqual<any>(getSnapshot(Factory({hello: {to: 'world'}})), {hello: {to: 'world'}})
})

// === SNAPSHOT TESTS ===
test("it should emit snapshots", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()

    let snapshots = []
    onSnapshot(doc, snapshot => snapshots.push(snapshot))

    doc.set("hello", ItemFactory())

    t.deepEqual(snapshots, [{hello: {to: 'world'}}])
})

test("it should apply snapshots", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()

    applySnapshot(doc, {hello: {to: 'universe'}})

    t.deepEqual<any>(getSnapshot(doc), {hello: {to: 'universe'}})
})

test("it should return a snapshot", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()

    doc.set("hello", ItemFactory())

    t.deepEqual<any>(getSnapshot<any, any>(doc), {hello: {to: 'world'}})
})


// === PATCHES TESTS ===
test("it should emit add patches", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()

    let patches = []
    onPatch(doc, patch => patches.push(patch))

    doc.set("hello", ItemFactory({to: "universe"}))

    t.deepEqual(patches, [
        {op: "add", path: "/hello", value: {to: "universe"}}
    ])
})

test("it should apply a add patch", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()

    applyPatch(doc, {op: "add", path: "/hello", value: {to: "universe"}})

    t.deepEqual<any>(getSnapshot(doc), {hello: {to: 'universe'}})
})

test("it should emit update patches", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()

    doc.set("hello", ItemFactory())

    let patches = []
    onPatch(doc, patch => patches.push(patch))

    doc.set("hello", ItemFactory({to: "universe"}))

    t.deepEqual(patches, [
        {op: "replace", path: "/hello", value: {to: "universe"}}
    ])
})

test("it should apply a update patch", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()

    applyPatch(doc, {op: "replace", path: "/hello", value: {to: "universe"}})

    t.deepEqual<any>(getSnapshot(doc), {hello: {to: 'universe'}})
})


test("it should emit remove patches", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()

    doc.set("hello", ItemFactory())

    let patches = []
    onPatch(doc, patch => patches.push(patch))

    doc.delete("hello")

    t.deepEqual(patches, [
        {op: "remove", path: "/hello"}
    ])
})

test("it should apply a remove patch", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()
    
    doc.set("hello", ItemFactory())

    applyPatch(doc, {op: "remove", path: "/hello"})

    t.deepEqual(getSnapshot(doc), {})
})

test("it should apply patches", (t) => {
    const {Factory, ItemFactory} = createTestFactories()
    const doc = Factory()

    applyPatches(doc, [{op: "add", path: "/hello", value: {to: "mars"}}, {op: "replace", path: "/hello", value: {to: "universe"}}])

    t.deepEqual<any>(getSnapshot(doc), {hello: {to: 'universe'}})
})

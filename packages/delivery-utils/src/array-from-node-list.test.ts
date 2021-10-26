import { arrayFromNodeList } from './array-from-node-list';

describe('Array From NodeList Test', () => {
    document.body.innerHTML = `
    <ul>
        <li>Test 0</li>
        <li>Test 1</li>
        <li>Test 2</li>
        <li>Test 3</li>
    </ul>
    `;

    test('Given an empty NodeList, return an empty array', () => {
        const converted = arrayFromNodeList(document.querySelectorAll('div'));

        expect(converted.length).toBe(0);
    });

    test('Array method forEach() should exist on prototype of array', () => {
        const converted = arrayFromNodeList(document.querySelectorAll('li'));

        converted.forEach((convertedNode, index) => {
            expect(convertedNode.innerHTML).toBe(`Test ${index}`);
        });
    });

    test('Changes to array items should mutate elements in NodeList', () => {
        arrayFromNodeList(document.querySelectorAll('li'))
            .forEach((convertedNode, index) => {
                convertedNode.innerHTML = `Testing ${index}`;
            });

        arrayFromNodeList(document.querySelectorAll('li'))
            .forEach((convertedNode, index) => {
                expect(convertedNode.innerHTML).toBe(`Testing ${index}`);
            });
    });
});

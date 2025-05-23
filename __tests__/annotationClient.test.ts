import { getIndex } from "@/functions/client/annotationClient"
import { initialAnnotationsAndPositions } from "@/interface/initializers"

test('annotation index getter', () => {
    expect(getIndex(initialAnnotationsAndPositions)).toBe(1);
    expect(getIndex({...initialAnnotationsAndPositions, activeAnnotationIndex: 1, numberOfAnnotations: 5, firstAnnotationPosition: 'a'})).toBe(1)
    expect(getIndex({...initialAnnotationsAndPositions, activeAnnotationIndex: 2, firstAnnotationPosition: 'a'})).toBe(2);
    expect(getIndex({...initialAnnotationsAndPositions, activeAnnotationIndex: 3, numberOfAnnotations: 5,})).toBe(3);
    expect(getIndex({...initialAnnotationsAndPositions, activeAnnotationIndex: "new", numberOfAnnotations: 5,})).toBe(7);
});
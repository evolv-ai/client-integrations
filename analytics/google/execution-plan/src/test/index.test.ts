import { GAClient } from "../index";

test('Validate everything works if GA is already loaded', async () => {
    window['ga'] = jest.fn();
    const client = new GAClient('trackingId', 'ns', 'candidateId', 'experimentId', 'userId');

    expect(window['ga']).not.toHaveBeenCalled();
});

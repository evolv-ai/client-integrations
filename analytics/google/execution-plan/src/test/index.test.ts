import { GAClient } from "../GAClient";

test('Validate everything works if GA is already loaded', async () => {
    window['ga'] = jest.fn();
    const client = new GAClient('trackingId', 'ns', );

    expect(window['ga']).not.toHaveBeenCalled();
});

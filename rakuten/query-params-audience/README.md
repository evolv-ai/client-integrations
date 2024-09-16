# Query Params Audience
Create an audience based on people who have visited your site with specific query parameters. You can use this to identify paid traffic.

This integration sets the local storage key `evolvParamStore` to a set value provided in the Environment's integration configuration JSON.

1. Add the integration to your account.
2. Open the environment where you want to use the integration.
3. Select the integration from the list of available integrations.
4. Set the configuration JSON.

## Configuration JSON
```
{
    "paramNameValues": [
        "utm_campaign=affiliate",
        "utm_medium=affiliate"
    ],
    "audienceValue": "my-audience-value"
}
```

### paramNameValues
Takes an array of strings. Each string should be a query parameter name and value pair separated by an equals sign. For example, `utm_campaign=affiliate`.

### audienceValue
Takes a string. This is the value that will be set in the local storage key `evolvParamStore`.

## Create an audience
1. Open the audiences page and select the audience you want to edit, or create a new audience.
2. Add a `Custom Attribute` to the audience.
3. Set the `Custom Attribute` to `evolvParamStore` and set the value you added in the configuration JSON.
4. Assign the audience to a project.

Only people who visit your site with the query parameters and values you specified will be added to the audience.

If they return to the site with a different URL, the local storage item will ensure they remain in the project audience.


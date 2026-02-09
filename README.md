# CalVer Tag Action

An opinionated lightweight git tagging action using [calendar versioning](https://calver.org) in the `YYYY.MM.MICRO`
format.

## Dependencies

To use the CalVer Tag action you must have checked out your repository as part of the job and fetch all available tags.
You can do this by using the [actions/checkout](https://github.com/actions/checkout) action to do this for you like so:

<!-- start actions-checkout example -->

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
    with:
      fetch-tags: true
```

<!-- end actions-checkout example -->

You will additionally be required to grant the `contents:write` permission for the tag to be pushed, you can do this in
your workflow like so:

<!-- start permissions example -->

```yaml
permissions:
  contents: write
```

<!-- end permissions example -->

## Usage

<!-- start usage -->

```yaml
name: my-workflow

on:
  push:
    branches: [ "master" ]

permissions:
  contents: write

jobs:
  my-job:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          fetch-tags: true
      - name: Calculate calendar version and apply tag
        uses: anthonygrimes/calver-tag-action@<version>
        id: versioning
      - name: Other step
        uses: <org>/<action>@<version>
        with:
          input: ${{steps.versioning.outputs.version}} # uses the version output from the versioning step
```

<!-- end usage -->

## Customizing

### outputs

The following outputs are available:

| Name      | Type   | Description                                       |
|-----------|--------|---------------------------------------------------|
| `version` | String | The tagged version created as part of this action |

## License

The project is licensed under the [MIT License](LICENSE).

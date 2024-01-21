# codeplex

### References & Requirements

- API Documentation https://docs.github.com/en/rest/reference
- The below image represents a `topic` of a particular repository, one repository could have multiple `topics`
  !https://s3-us-west-2.amazonaws.com/secure.notion-static.com/7743fc64-964a-4fb2-a231-d646d2d88e0a/Screenshot_2021-05-17_at_3.11.10_AM.png
- Pagination has to be `server`-side
  - By default, show `10` repositories per page
  - User should be able to choose a maximum of `100` repositories per page.
- When the API calls are in progress, consider showing loaders.
- Optionally, you can provide a search bar to filter the repositories.

The site is built with pure HTML, CSS & Javascript (along with jQuery).

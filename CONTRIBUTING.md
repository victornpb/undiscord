# Contributing

# Before making any changes ✋
## Do not edit files at top

Please do not make changes to the `.js` files in the top directory!  
Only make changes to the files inside the `src/` folder, otherwise I can't merge your changes back to the project.

Also, do not commit changes to the `deleteDiscordMessages.user.js` file!

## Oddities about this project

> This is NOT your typical javascript App, so this project has a few oddities:

- Do NOT add external dependencies or libraries.  
  The only allowed dependencies are related things that run during build and testing.
  The script itself should't import or load anything external.
  The reason for this is security, if the user has to audit external packages we're doomed.

- Do NOT use Prettier.  
  This project has to stay fairly short in order to be auditable in a short amount of time.
  For that reason some parts of the code favor compactness instead of consistency of indentation.


-------------------------------------------------------------------------------

# Now that you read that, this is what youo do:

## Building the project

If you're unfamilliar with compiled Javascript, this is how you do it:

1. Clone the repository to your computer
2. Open the terminal inside the cloned directory
3. Run `npm i` to download the project dependencies 
4. Run `npm start` it will automatically compile the project, when you make changes

## Testing locally

Open the URL that shows up in your console when you run `npm start` it will ask you to install a development version of Undiscord.
You need to click the update button every time you make changes in TamperMonkey, or reinstall it by opening the URL again.

You can alternatively test manually:

Copy the contents of the `deleteDiscordMessages.user.js` at the top of the repository,
and paste it directly into your browser console.

----------------------------------------------------------------


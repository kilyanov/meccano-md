<!DOCTYPE html>
<html lang="en">
    <?php
        $assets = json_decode(file_get_contents(__DIR__ . '/assets.json'), true);
    ?>

    <head>
        <title>Meccano</title>
        <base href="/"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" href="/favicons/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="./<?=$assets['main']['css']?>">
    </head>
    <body>
        <div id="root"></div>
        <script src="./<?=$assets['main']['js']?>"></script>
    </body>
</html>

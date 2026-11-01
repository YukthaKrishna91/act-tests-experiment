function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createTitle(text) {
  var $title = document.createElement('h2');
  $title.textContent = text;
  return $title;
}

function createParagraph(text) {
  var $paragraph = document.createElement('p');
  $paragraph.textContent = text;
  return $paragraph;
}

function injectStyle(styles) {
  var $style = document.createElement('style');
  $style.innerHTML = styles.join('\n');
  document.body.appendChild($style);
}

function createItem(className) {
  var $item = document.createElement('div');
  $item.classList.add('item');
  $item.classList.add(className);
  return $item;
}

function createItemGroup(className, childCount) {
  var $group = document.createElement('div');
  $group.classList.add('item-group');

  var childElements = [];
  for (var index = 0; index < childCount; index++) {
    childElements.push(createItem(className));
  }

  childElements.forEach(function (element) {
    $group.appendChild(element);
  });
  return $group;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  var styles = [
    'h2 { margin:10px 0 0; padding:0; }',
    'p { margin:0 0 10px; padding:0; }',
    '.item { width: 50px; height: 50px; display: inline-block; margin: 5px; background-color: rgb(0, 100, 100) }',
    '.item-first:first-child { background-color: rgb(200, 50, 0) }',
    '.item-last:last-child { background-color: rgb(200, 50, 0)}',
    '.item-only:only-child { background-color: rgb(200, 50, 0)}',
    '.item-nth:nth-child(even) { background-color: rgb(200, 50, 0)}'
  ];
  injectStyle(styles);

  var $title1 = createTitle('First Child');
  $container.appendChild($title1);
  var $description1 = createParagraph('The first item should be red');
  $container.appendChild($description1);
  var $group1 = createItemGroup('item-first', 4);
  $container.appendChild($group1);

  var $title2 = createTitle('Last Child');
  $container.appendChild($title2);
  var $description2 = createParagraph('The last item should be red');
  $container.appendChild($description2);
  var $group2 = createItemGroup('item-last', 5);
  $container.appendChild($group2);

  var $title3 = createTitle('Only Child');
  $container.appendChild($title3);
  var $description3 = createParagraph('The item should be red');
  $container.appendChild($description3);
  var $group3 = createItemGroup('item-only', 1);
  $container.appendChild($group3);

  var $title4 = createTitle('nth Child');
  $container.appendChild($title4);
  var $description4 = createParagraph('The second and fourth items should be red');
  $container.appendChild($description4);
  var $group4 = createItemGroup('item-nth', 5);
  $container.appendChild($group4);

  act.render($container, function () {
    var firstColour = getComputedStyle(
      document.querySelector('.item-first:first-child')
    ).getPropertyValue('background-color');
    var secondColour = getComputedStyle(
      document.querySelector('.item-last:last-child')
    ).getPropertyValue('background-color');
    var thirdColour = getComputedStyle(
      document.querySelector('.item-only:only-child')
    ).getPropertyValue('background-color');
    var fourthColour = getComputedStyle(
      document.querySelector('.item-nth:nth-child(even)')
    ).getPropertyValue('background-color');

    if (firstColour !== 'rgb(200, 50, 0)') {
      act.fail('Selecting :first failed ');
    } else if (secondColour !== 'rgb(200, 50, 0)') {
      act.fail('Selecting :last failed ');
    } else if (thirdColour !== 'rgb(200, 50, 0)') {
      act.fail('Selecting :only failed ');
    } else if (fourthColour !== 'rgb(200, 50, 0)') {
      act.fail('Selecting :nth-child failed ');
    } else {
      act.success();
    }
  });
}

loadSDK(runTest);

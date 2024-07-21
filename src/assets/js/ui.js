// getfilename
function getFileName(url) {
    return url.substring(url.lastIndexOf('/') + 1);
}

$(function () {
  function getCSSVariableValue(variableName, element = document.documentElement) {
    const elementStyles = getComputedStyle(element);
    return elementStyles.getPropertyValue(variableName).trim();
  }

  // changeThemeColor
  function changeThemeColor(theme) {
    const colorLists = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'focus', 'bg', 'contrast'];
    const colorDepthTitle = ['darker', 'dark', 'medium', 'light', 'lighter'];
    const colorContrast = ['higher', 'high', 'medium', 'low', 'lower'];

    var darkThemeElement = '';
    if (theme == 'dark-theme') {
      darkThemeElement = document.querySelector('[data-theme=dark-theme]');
    }

    for(var i = 0; i < colorLists.length; i++) {
      for(var j = 0; j < colorDepthTitle.length; j++) {
        var colorVariable = '--color-' + colorLists[i] + '-' + colorDepthTitle[j];

        if (colorLists[i] == 'contrast') {
          colorVariable = '--color-contrast-' + colorContrast[j];
        } else {
          if (colorDepthTitle[j] == 'medium') colorVariable = '--color-' + colorLists[i];
        }
        
        var colorVal = '';
        if (theme == 'dark-theme') {
          colorVal = getCSSVariableValue(colorVariable, darkThemeElement);
        } else {
          colorVal = getCSSVariableValue(colorVariable);
        }

        $('.' + colorVariable).text('').text(colorVal);
      }
    }
  }

  // .btn-toggle-theme
  $(".app-switch-theme .app-sidebar-nav-item button").on("click", function (e) {
    e.preventDefault();

    let $body = $("body"), $this = $(this), $canvas = $(".app-canvas"), $iframe = $("iframe[name='app-view']").contents();;
    let attrTheme = $this.attr('data-val');
    $(".app-switch-theme .app-sidebar-nav-item button").removeClass('is-active');
    $this.addClass('is-active');

    if (attrTheme == 'dark-theme') {
      $body.attr('data-theme', 'dark-theme');
      $iframe.find('body').attr('data-theme', 'dark-theme');
      localStorage.setItem("theme", "dark-theme");
      changeThemeColor('dark-theme');
    } else {
      $body.attr('data-theme', '');
      $iframe.find('body').attr('data-theme', '');
      localStorage.setItem("theme", "default");
      changeThemeColor();
    }
  });

  // 
  if ($(".app-color-list").length) {
    changeThemeColor();

    document.querySelectorAll('.app-color-list .app-preview-item').forEach(element => {
      element.addEventListener('click', () => {
        const value = element.getAttribute('data-value');
        navigator.clipboard.writeText(value).then(() => {
          alert(`Copied to clipboard: ${value}`);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      });
    });
  }

  // init theme
  function initTheme(){
    const currentTheme = localStorage.getItem("theme") || 'default';
    if (currentTheme == 'default') {
      $("body").attr('data-theme', '');
      $(".app-switch-theme .app-sidebar-nav-item button[data-val=default]").click();
    } else {
      $("body").attr('data-theme', 'dark-theme');
      $(".app-switch-theme .app-sidebar-nav-item button[data-val=dark-theme]").click();
    }
  }
  initTheme();

  // init sidebar
  function sidebarInit() {
    console.log();

    var currentPageId = localStorage.getItem('currentPage') || '';
    if (currentPageId != '') {
      $(".app-sidebar-nav-item > li > a").removeClass("is-active");
      $(".app-sidebar-nav-item > li > a[id='iframe-" + currentPageId + "']").addClass("is-active");
    }

    $(".app-sidebar-nav-item > li > a").on("click", function () {
      var $this = $(this);
      $(".app-sidebar-nav-item > li > a").removeClass("is-active");
      $(this).addClass("is-active");
    });
  }
  sidebarInit();
  
  // iframe load
  var savedSrc = localStorage.getItem('iframeSrc');
  if (savedSrc) { $('iframe#app-view').attr('src', savedSrc); }
  
  $('iframe#app-view').on('load', function() {
    var currentSrc = $(this).contents().get(0).location.href;
    localStorage.setItem('iframeSrc', currentSrc);
    localStorage.setItem('currentPage', getFileName(currentSrc).replace('.html', ''));
  });

});
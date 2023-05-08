$('document').ready(function() {
    var exchangeRate;
    const maxBTC = 2099999997690000 / 100000000;
  
    function addCommas(input, decimalPlaces) {
      // Separate the whole number part and the decimal part
      let [whole, decimal] = input.toFixed(decimalPlaces).split('.');
  
      // Add commas to the whole number part
      whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
      // Combine the whole number part with the decimal part
      return decimal ? `${whole}.${decimal}` : whole;
    }
  
    function changeSats(dollars) {
       var sats = addCommas(100000000 / exchangeRate * dollars, 0);
       $('#sats').val(sats);
    }
  
    function changeDollars(sats) {
      var dollars = sats * exchangeRate / 100000000;
      var decimalPlaces = (dollars < 0.01) ? 3 : 2;
      if (sats == 1)
        decimalPlaces = 4;
      const formattedDollars = addCommas(dollars, decimalPlaces);
      $("#dollars").val(formattedDollars);
    }
  
    $('#sats').on('input', function () {
      var sats = $(this).val();
      sats = parseInt(sats.replace(/,/g,''));
  
      // there will never be more than 2,099,999,997,690,000 satoshis!
      if (sats > 2099999997690000)
        sats = 2099999997690000;
  
      if (sats < 0 || isNaN(sats)) {
        $(this).val("");
        $('#dollars').val("0.00");
        return;
      }
  
      $(this).val(addCommas(sats, 0));
      changeDollars(sats);
      resizeInput();
    });
  
    $('#dollars').on('input', function () {
      var dollars = $(this).val();
  
      // Check if the input starts with a dot, and prepend a zero if necessary
      if (dollars.charAt(0) === '.')
        dollars = '0' + dollars;
  
      dollars = dollars.replace(/,/g, '');  // Remove commas
      dollars = dollars.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except for the period
      dollars = dollars.replace(/(\..*)\./g, '$1'); // Remove any additional periods after the first one
      //dollars = parseFloat(dollars.replace(/,/g,''));
  
      // Limit decimal places to a maximum of 4
      if (dollars.toString().split('.')[1]?.length > 4)
        dollars = dollars.replace(/(\.\d{4})\d+/, '$1');
  
      // can't be more than total supply
      if (dollars > exchangeRate * maxBTC) {
        dollars = exchangeRate * maxBTC;
        dollars = parseFloat(dollars.toFixed(2));
      }
  
      if (dollars < 0 || isNaN(dollars)) {
        console.log('NaN');
        $(this).val("");
        $('#sats').val("0");
        return;
      }
  
      // add commas to part before decimal place
      const parts = dollars.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      $(this).val(parts.join('.'));
  
      changeSats(dollars);
      resizeInput();
    });
  
    $('input').click(function() {
      $(this).select();
      resizeInput();
    });
  
    function resizeInput() {
    // sats will be more numbers than dollars (at least for now muhahaha)
      $('input').each(function() {
        // don't want to include commas or periods
        var length = $(this).val().length;
        var newLength = length * 9;
        // console.log("new length of " + $(this).attr('id') + " is " + newLength);
        if (newLength > 98) {
          $(this).width(newLength);
        }
        else {
          $(this).width(83);
        }
      });
      // console.log("dollars width is " + $('#dollars').width());
      if ($('#dollars').width() > $('#sats').width()) {
        $('#sats').width($('#dollars').width() - 24);
      }
      else {
        $('#dollars').width($('#sats').width() + 24);
      }
    }
  
    function updateExchangeRate() {
      $.getJSON("https://api.coindesk.com/v1/bpi/currentprice/mxn.json", function(data) {
         exchangeRate = Number(data.bpi.MXN.rate_float);
         console.log(exchangeRate);
      });
      setTimeout(updateExchangeRate, 1000 * 100);
    }
  
    function startHere() {
        $.getJSON("https://api.coindesk.com/v1/bpi/currentprice/mxn.json", function(data) {
           exchangeRate = Number(data.bpi.MXN.rate_float);
           console.log(exchangeRate);
           const urlParams = new URLSearchParams(window.location.search);
           if (urlParams.has('sats')) {
             const amount = urlParams.get('sats');
             $('#sats').val(addCommas(Number(amount), 0));
             changeDollars(amount);
             resizeInput();
           }
           else {
             // initialize with $1.00 to start
             changeSats(1);
           }
        });
        // updates the exchange rate every 100 seconds
        setTimeout(updateExchangeRate, 1000 * 100);
    }
  
    startHere();
    });
  
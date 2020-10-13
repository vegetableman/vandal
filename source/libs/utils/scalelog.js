import { interpolateRgb } from 'd3-interpolate';
import bisect from './bisect';

function identity(x) {
  return x;
}

function transformLog(x) {
  return Math.log(x);
}

function transformExp(x) {
  return Math.exp(x);
}

function transformExpn(x) {
  return -Math.exp(-x);
}

function transformLogn(x) {
  return -Math.log(-x);
}

function reflect(f) {
  return function(x) {
    return -f(-x);
  };
}

function pow10(x) {
  return isFinite(x) ? +('1e' + x) : x < 0 ? 0 : x;
}

function powp(base) {
  return base === 10
    ? pow10
    : base === Math.E
    ? Math.exp
    : function(x) {
        return Math.pow(base, x);
      };
}

function logp(base) {
  return base === Math.E
    ? Math.log
    : (base === 10 && Math.log10) ||
        (base === 2 && Math.log2) ||
        ((base = Math.log(base)),
        function(x) {
          return Math.log(x) / base;
        });
}

function constant(x) {
  return function() {
    return x;
  };
}

function normalize(a, b) {
  if ((b -= a = +a)) {
    return function(x) {
      return (x - a) / b;
    };
  } else {
    constant(isNaN(b) ? NaN : 0.5);
  }
}

function polymap(domain, range, interpolate) {
  var j = Math.min(domain.length, range.length) - 1,
    d = new Array(j),
    r = new Array(j),
    i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }

  return function(x) {
    var i = bisect(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function clamper(a, b) {
  var t;
  if (a > b) (t = a), (a = b), (b = t);
  return function(x) {
    return Math.max(a, Math.min(b, x));
  };
}

function number(x) {
  return +x;
}

var unit = [0, 1];

function transformer() {
  var domain = unit,
    range = unit,
    interpolate = interpolateRgb,
    transform,
    untransform,
    unknown,
    clamp = identity,
    piecewise,
    output,
    input;

  function rescale() {
    var n = Math.min(domain.length, range.length);
    if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
    piecewise = polymap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return isNaN((x = +x))
      ? unknown
      : (
          output ||
          (output = piecewise(domain.map(transform), range, interpolate))
        )(transform(clamp(x)));
  }

  scale.invert = function(y) {
    return clamp(
      untransform(
        (
          input ||
          (input = piecewise(range, domain.map(transform), interpolateNumber))
        )(y)
      )
    );
  };

  scale.domain = function(_) {
    return arguments.length
      ? ((domain = Array.from(_, number)), rescale())
      : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length
      ? ((range = Array.from(_)), rescale())
      : range.slice();
  };

  scale.clamp = function(_) {
    return arguments.length
      ? ((clamp = _ ? true : identity), rescale())
      : clamp !== identity;
  };

  scale.interpolate = function(_) {
    return arguments.length ? ((interpolate = _), rescale()) : interpolate;
  };

  scale.unknown = function(_) {
    return arguments.length ? ((unknown = _), scale) : unknown;
  };

  return function(t, u) {
    (transform = t), (untransform = u);
    return rescale();
  };
}

function loggish(transform) {
  var scale = transform(transformLog, transformExp),
    domain = scale.domain,
    base = 10,
    logs,
    pows;

  function rescale() {
    (logs = logp(base)), (pows = powp(base));
    if (domain()[0] < 0) {
      (logs = reflect(logs)), (pows = reflect(pows));
      transform(transformLogn, transformExpn);
    } else {
      transform(transformLog, transformExp);
    }
    return scale;
  }

  scale.base = function(_) {
    return arguments.length ? ((base = +_), rescale()) : base;
  };

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  return scale;
}

function initRange(domain, range) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range).domain(domain);
      break;
  }
  return this;
}

export default function log() {
  var scale = loggish(transformer()).domain([1, 10]);

  scale.copy = function() {
    return copy(scale, log()).base(scale.base());
  };

  initRange.apply(scale, arguments);

  return scale;
}

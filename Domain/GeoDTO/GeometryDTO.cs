﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
  public class GeometryDTO
  {
    public string id { get; set; }
    public string type { get; set; }
    public double[] points { get; set; } //LatLng
  }
}

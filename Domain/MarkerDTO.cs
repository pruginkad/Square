﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
  public class MarkerDTO
  {
    public string id { get; set; }

    public string parent_id { get; set; }
    public string name { get; set; } = null;
    public double[] points { get; set; }
    public bool has_children { get; set; }
  }
}

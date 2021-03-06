using System;

namespace Domain
{
  public class MapDatabaseSettings
  {
    public string ConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    public string ObjectsCollectionName { get; set; } = null!;
    public string GeoCollectionName { get; set; } = null!;
    public string TracksCollectionName { get; set; } = null!;
    public string PropCollectionName { get; set; } = null!;
  }
}

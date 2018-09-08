using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.Extensions.Options;
using VSWebApp.Models;
using System.IO;
using System.Text;

namespace VSWebApp.Controllers
{
    [Produces("application/json")]
    [Route("api/Search")]

    public class SearchController : Controller
    {
        private AppSettings _appSettings;

        public SearchController(IOptions<VSWebApp.Models.AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        [HttpPost]
        public async Task Post(string mkt = null)
        {
            var baseUri = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect";
            using (var client = new HttpClient())
            {
                string accessKey = _appSettings.accessKey;
                client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", accessKey);
                string requestParameters = "returnFaceId=false&returnFaceLandmarks=false" +
                "&returnFaceAttributes=emotion";
                string uri = baseUri + "?" + requestParameters;

                HttpResponseMessage response;

                var form = await Request.ReadFormAsync();

                foreach (var kvp in form)
                {
                    var k = kvp.Key;
                    var v = kvp.Value;
                }

                byte[] byteData = null;

                foreach (var file in form.Files)
                {
                    BinaryReader binaryReader = new BinaryReader(file.OpenReadStream());
                    byteData = binaryReader.ReadBytes((int)file.OpenReadStream().Length);
                }
                
                using (ByteArrayContent content = new ByteArrayContent(byteData))
                {
                    // This example uses content type "application/octet-stream".
                    // The other content types you can use are "application/json"
                    // and "multipart/form-data".
                    content.Headers.ContentType =
                        new MediaTypeHeaderValue("application/octet-stream");

                    // Execute the REST API call.
                    response = await client.PostAsync(uri, content);

                    var stream = await response.Content.ReadAsStreamAsync();
                    stream.CopyTo(Response.Body);

                    Response.ContentLength = stream.Length;
                }
            }
        }
    }
}
